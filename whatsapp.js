const { Client, NoAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const {
  getConversationState,
  setConversationState,
} = require("./conversationState");
const context = require("./context");

const client = new Client({ authStrategy: new NoAuth() });

client.initialize();

async function generateQRCode() {
  return new Promise((resolve, reject) => {
    client.on("qr", (qr) => {
      qrcode.toDataURL(qr, (err, url) => {
        if (err) {
          reject(err);
        } else {
          resolve(url);
        }
      });
    });
  });
}
client.on("ready", () => {
  console.log("WhatsApp Client is ready!");
});

async function sendMessage(phoneNumber, message, firstName = "") {
  try {
    phoneNumber = phoneNumber.replace("+", ""); // Remove '+' if present
    const whatsappNumber = phoneNumber + "@c.us";
    await client.sendMessage(whatsappNumber, message);
    console.log(`Message sent to ${whatsappNumber}`);
  } catch (error) {
    console.error(`Failed to send message to ${phoneNumber}`, error);
  }
}

let firstName = "";

context.on("firstName", (name) => {
  firstName = name;
});
context.on("budget", (budget) =>{
  newBudget = budget
});

client.on("message", async (msg) => {
  if (msg.body.toLowerCase() === "start") {
    const userId = msg.from;
    // const name = firstName;
    const name = firstName; // Use the updated firstName here

    setConversationState(userId, { stage: "question1" });

    setTimeout(() => {
      client.sendMessage(
        userId,
        `${name} To help you find your perfect home, we'd love to know more about what you like. This will help us tailor the search just for you:`
      );
    }, 3000);
  } else {
    const userId = msg.from;
    const state = getConversationState(userId);

    switch (state.stage) {
      case "question1":
        setConversationState(userId, { stage: "question2" });
        setTimeout(() => {
          client.sendMessage(
            userId,
            `📍Location: What's your ideal area or neighborhood?`
          );
        }, 3000);
        break;
      case "question2":
        setConversationState(userId, { stage: "question3" });
        setTimeout(() => {
          client.sendMessage(
            userId,
            `🏠 What is your style: What style of home are you drawn to? (modern, traditional, loft)`
          );
        }, 3000);
        break;
      case "question3":
        setConversationState(userId, { stage: "question4" });

        setTimeout(() => {
          client.sendMessage(
            userId,
            `🤩 Extras: What do your prefer (e.g., balcony, pet-friendly)`
          );
        }, 3000);
        break;
      case "question4":
        setConversationState(userId, { stage: "question5" });
        setTimeout(() => {
          client.sendMessage(
            userId,
            `🎉 Congratulations! We're thrilled to help you find the perfect home. We'll be in touch with some listings soon.`
          );
        }, 3000);
        setTimeout(() => {
          client.sendMessage(
            userId,
            `📈 Speed up the process! Upload your documents now for priority assistance and get listings faster. https://upload.ynsagency.nl
  
  PS. Can't click the link? Just add us to contacts to activate it!

  ✅ Type 'done' after uploading.
  
  😕 Prefer not to? Type 'listings'.`
          );
        }, 10000);
        break;
      case "question5":
        const budget1 = newBudget;
        setConversationState(userId, { stage: "question6" });
        setTimeout(() => {
          client.sendMessage(
            userId,
            `Shall we stick to listings within your budget of ${budget1} only? 😊 

Or open to exceeding it for the right match? Please reply with your max budget.`
          );
        }, 5000);
        break;
      default:
        // Optional: handle unexpected messages or reset the conversation
        break;
    }
  }
});

module.exports = { sendMessage, generateQRCode };
