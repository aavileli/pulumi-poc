import { tg_vpc_outputs } from "./tg_vpc_output";
import { Input, Config, getStack } from "@pulumi/pulumi";


const config = new Config();
const state_bucket = config.requireSecret("state_bucket");

/**
 * creating instance to consume in this project
 * The tg_vpc_output customresource component could be pushed as a npm package
 */
const network = new tg_vpc_outputs(
  "terragrunt_vpc_id",
  {
    s3_bucket: state_bucket,
  }
);

/**
 * exposing this to pulumi stack output to demonstrate how cross project/stack consumption
 * is also possible
 */
export const vpcID = network.getOutput("vpc_id");
export const vpc_cidr_block = network.getOutput("vpc_cidr_block")
export const private_subnets = network.getOutput("private_subnets");
export const public_subnets = network.getOutput("public_subnets");
