import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import { NodeJS12dXRuntime } from "@pulumi/aws/lambda";

/**
 *  import 
 */
import { getServiceRole, vpcOutputs } from "./lib"

/**
 * get vpc details from pulumi bgl_terragrunt_vpc stack. This is to demonstrate cross stack resource sharing
 * please note the namespace format org/project/stack. ashley is the org, project is bgl_terragrunt_vpc and stack is dev. there are other
 * stacks for differnet enivornments prod, sgprod, etc
 */
const stack_id = pulumi.getStack()
const vpc_stackOuputs = vpcOutputs(`ashley/bgl_terragrunt_vpc/${stack_id}`)


/**
 * creating lambda execution role
 */
const role = getServiceRole("lambda.amazonaws.com")


/**
 * attaching the policy document to role
 */
new aws.iam.RolePolicyAttachment("lambdaRolePolicy", {
  role: role.name,
  policyArn: aws.iam.ManagedPolicies.AWSLambdaVPCAccessExecutionRole,
});

/**
 * creating lambda security group
 */

const sg = new aws.ec2.SecurityGroup("lambda", {
  ingress: [
    {
      protocol: "tcp",
      fromPort: 80,
      toPort: 80,
      cidrBlocks: [vpc_stackOuputs.vpc_cidr_block, "172.16.200.0/24"],
    },
  ],
  egress: [
    { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
  ],
  vpcId: vpc_stackOuputs.vpc_id,
});


/**
 * creates the lambda function and produces an assesfileArchive from Asset Class composing the file archive https://www.pulumi.com/docs/intro/concepts/assets-archives/ 
 */

const lambdaFunc = new aws.lambda.Function("lambdaFunc", {
  code: new pulumi.asset.AssetArchive({
    ".": new pulumi.asset.FileArchive("./app"),
  }),
  runtime: NodeJS12dXRuntime,
  role: role.arn,
  handler: "index.handler",
  vpcConfig: {
    subnetIds: vpc_stackOuputs.vpc_private_subnets,
    securityGroupIds: [sg.id],
  }
});

/**
 * Provides a Lambda function URL resource. A function URL is a dedicated HTTP(S) endpoint for a Lambda function.
 */
const lambdaUrl = new aws.lambda.FunctionUrl("lambdaUrl",{
  authorizationType: "NONE",
  functionName: lambdaFunc.name
})

export const lambda_url =  lambdaUrl.functionUrl
export const lambda_function = lambdaFunc.name