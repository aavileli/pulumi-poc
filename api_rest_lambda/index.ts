import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
// import * as apigateway from "@pulumi/aws-apigateway";
import * as awsx from "@pulumi/awsx";


const config = new pulumi.Config()

const secOpsPolicy = config.requireSecret("secOpsPolicy")

/**
 * this function transforms all intercepted properties from parent to child in the stack
 * 
 */
pulumi.runtime.registerStackTransformation( args => {
    if (args.type === 'aws:iam/role:Role'){
      return {
           ...args,
           props: { ...args.props, permissionsBoundary: secOpsPolicy},
      };
    }
    return undefined;
  });


// A Lambda function to invoke
const fn = new aws.lambda.CallbackFunction("fn", {
    callback: async (ev, ctx) => {
        return {
            statusCode: 200,
            body: new Date().toISOString(),
        };
    },
})

/**
 *  moved this to use the awsx package due to a bug in the pulumi-aws-apigateway for overiding roles not working
    bug opened at https://github.com/pulumi/pulumi-aws-apigateway/issues/59 
*/ 
// A REST API to route requests to HTML content and the Lambda function
const api = new awsx.classic.apigateway.API("api", {
  routes: [
      { path: "/", localPath: "www"},
      { path: "/date", method: "GET", eventHandler: fn },
  ]
});

// The URL at which the REST API will be served.
export const url = api.url;
