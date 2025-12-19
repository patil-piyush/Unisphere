// utils/mailTemplates.js

const eventRejectedTemplate = (eventName) => {
  return {
    subject: "Event Rejected",
    text: `Your event "${eventName}" has been rejected.`,
  };
};

module.exports = {
  eventRejectedTemplate,
};
