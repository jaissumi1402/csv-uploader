const csv = require("csv-parser");
const xlsx = require("xlsx");
const { Readable } = require("stream");
const moment = require("moment");
const Agent = require("../models/agent");
const Account = require("../models/account");
const Carrier = require("../models/carrier");
const LOB = require("../models/lob");
const Policy = require("../models/policy");
const User = require("../models/user");

const uploadFile = async (req, res) => {
  try {
    const file = req.files[0];
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    let parsedData;

    if (file.originalname.endsWith(".xlsx")) {
      parsedData = parseExcelFile(file.buffer);
    } else if (file.originalname.endsWith(".csv")) {
      parsedData = await parseCSVFile(file.buffer);
    } else {
      return res.status(400).json({ message: "Invalid file format" });
    }

    await saveDataToCollections(parsedData);

    return res
      .status(200)
      .json({ message: "File uploaded and data saved successfully" });
  } catch (error) {
    console.error("Error during file upload:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Function to parse an Excel file
const parseExcelFile = (buffer) => {
  const workbook = xlsx.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  return xlsx.utils.sheet_to_json(worksheet, { header: 1 });
};

// Function to parse a CSV file
const parseCSVFile = (buffer) => {
  return new Promise((resolve, reject) => {
    const parsedData = [];
    let isHeaderRow = true; // Flag to skip the header row

    const csvStream = csv({ headers: true })
      .on("data", (data) => {
        if (isHeaderRow) {
          isHeaderRow = false;
          return; // Skip the header row
        }

        // Transform and extract data from CSV rows
        const transformedData = {
          agent: data._0 || "",
          usertype: data._1 || "",
          policy_mode: data._2 || "",
          producer: data._3 || "",
          policy_number: data._4 || "",
          premium_amount_written: data._5 || "",
          premium_amount: data._6 || "",
          policy_type: data._7 || "",
          company_name: data._8 || "",
          category_name: data._9 || "",
          policy_start_date: data._10 || "",
          policy_end_date: data._11 || "",
          csr: data._12 || "",
          account_name: data._13 || "",
          email: data._14 || "",
          gender: data._15 || "",
          name: data._16 || "",
          city: data._17 || "",
          account_type: data._18 || "",
          phone: data._19 || "",
          address: data._20 || "",
          state: data._21 || "",
          zip: data._22 || "",
          dob: data._23 || "",
          primary: data._24 || "",
          "applicant id": data._25 || "",
          agency_id: data._26 || "",
          "hasactive clientpolicy": data._27 || "",
        };
        parsedData.push(transformedData);
      })
      .on("error", (error) => reject(error))
      .on("end", () => resolve(parsedData));

    const readableStream = Readable.from(buffer.toString());
    readableStream.pipe(csvStream);
  });
};

// Function to save data to collections
const saveDataToCollections = async (data) => {
  try {
    const { agentSet, lobSet, companyLobMap } = extractUniqueData(data);
    const lobInstances = await uploadLOBs(lobSet);
    const carrierInstances = await uploadCarriers(companyLobMap, lobInstances);
    const agentInstances = await uploadAgents(agentSet);

    await uploadAccountsAndPolicies(
      data,
      lobInstances,
      carrierInstances,
      agentInstances
    );
  } catch (error) {
    console.log(error);
  }
};

// Function to extract unique data from parsed data
const extractUniqueData = (data) => {
  const agentSet = new Set();
  const lobSet = new Set();
  const companyLobMap = new Map();

  data.forEach((item) => {
    agentSet.add(item.agent);
    lobSet.add(item.category_name);

    if (!companyLobMap.has(item.company_name)) {
      companyLobMap.set(item.company_name, new Set());
    }
    companyLobMap.get(item.company_name).add(item.category_name);
  });

  return { agentSet, lobSet, companyLobMap };
};

// Function to upload LOBs (Lines of Business)
const uploadLOBs = async (lobSet) => {
  const lobPromises = Array.from(lobSet).map(async (category_name) => {
    let existingLOB = await LOB.findOne({ category_name });
    if (!existingLOB) {
      existingLOB = await LOB.create({ category_name });
    }
    return existingLOB;
  });
  return Promise.all(lobPromises);
};

// Function to upload carriers
const uploadCarriers = async (companyLobMap, lobInstances) => {
  const carrierPromises = Array.from(companyLobMap).map(
    async ([company_name, lobSet]) => {
      let existingCarrier = await Carrier.findOne({ company_name });
      if (!existingCarrier) {
        const lobIds = await Promise.all(
          Array.from(lobSet).map(async (category_name) => {
            const existingLOB = lobInstances.find(
              (lob) => lob.category_name === category_name
            );
            return existingLOB._id;
          })
        );
        existingCarrier = await Carrier.create({
          company_name,
          category: lobIds,
        });
      }
      return existingCarrier;
    }
  );
  return Promise.all(carrierPromises);
};

// Function to upload agents
const uploadAgents = async (agentSet) => {
  const agentPromises = Array.from(agentSet).map(async (agentName) => {
    let existingAgent = await Agent.findOne({ agent: agentName });
    if (!existingAgent) {
      existingAgent = await Agent.create({ agent: agentName });
    }
    return existingAgent;
  });
  return Promise.all(agentPromises);
};

// Function to upload accounts, users and policies
const uploadAccountsAndPolicies = async (
  data,
  lobInstances,
  carrierInstances,
  agentInstances
) => {
  const accountMap = new Map(); // Map to store existing accounts by account name
  const policyInstances = [];

  const promises = data.map(async (item) => {
    const {
      account_name,
      account_type,
      userType,
      policy_number,
      name,
      email,
      gender,
      city,
      phone,
      address,
      state,
      zip,
      dob,
      premium_amount,
      category_name,
      company_name,
      premium_amount_written,
      policyMode,
      policy_type,
      policy_start_date,
      policy_end_date,
      csr,
      agent,
    } = item;

    let existingAccount = accountMap.get(account_name);

    if (!existingAccount) {
      existingAccount = await Account.findOne({ account_name }).populate(
        "user"
      );
      accountMap.set(account_name, existingAccount);
    }

    if (existingAccount) {
      const userExists = existingAccount.user.find(
        (user) => user.policy_number === policy_number
      );
      if (userExists) {
        // Skip processing if the user already exists for the account
        return null;
      }
    }

    let existingUser = await User.findOne({ policy_number });

    if (!existingUser) {
      const parsedDob = moment(dob, "DD-MM-YYYY").toDate();
      const newUser = await User.create({
        userType,
        policy_number,
        account_name,
        name,
        email,
        gender,
        city,
        phone,
        address,
        state,
        zip,
        dob: parsedDob,
      });
      existingUser = newUser;

      if (existingAccount) {
        existingAccount.user.push(existingUser._id);
        await existingAccount.save();
      } else {
        const newAccount = await Account.create({
          account_name,
          account_type,
          user: [existingUser._id],
        });
        accountMap.set(account_name, newAccount);
      }
    }

    const existingPolicy = await Policy.findOne({ policy_number });

    if (!existingPolicy) {
      const existingAgentInstance = agentInstances.find(
        (agentInstance) => agentInstance.agent === agent
      );
      const existingLOB = lobInstances.find(
        (lob) => lob.category_name === category_name
      );
      const existingCarrier = carrierInstances.find(
        (carrier) => carrier.company_name === company_name
      );

      const parsedStartDate = moment(policy_start_date, "DD-MM-YYYY").toDate();
      const parsedEndDate = moment(policy_end_date, "DD-MM-YYYY").toDate();

      const newPolicy = await Policy.create({
        policy_number,
        premium_amount,
        premium_amount_written,
        policyMode,
        policy_type,
        policy_start_date: parsedStartDate,
        policy_end_date: parsedEndDate,
        csr,
        user: existingUser._id,
        agent: existingAgentInstance._id,
        lob: existingLOB._id,
        carrier: existingCarrier._id,
      });

      policyInstances.push(newPolicy);

      return { account: existingAccount, policy: newPolicy };
    }

    return null;
  });

  await Promise.all(promises);

  return { accountInstances: Array.from(accountMap.values()), policyInstances };
};

module.exports = { uploadFile };
