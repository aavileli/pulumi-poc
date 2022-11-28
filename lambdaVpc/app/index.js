exports.handler =  async function(event, context) {
    console.log("EVENT: \n" + JSON.stringify(event, null, 2))
    return {
        statusCode: 200,
        body: "Direct http function call without api-gateway - Ashley!\n"
    };
  }