import {
  Config,
  ComponentResource,
  ComponentResourceOptions,
  Input,
  Output,
} from "@pulumi/pulumi";

import * as terraform from "@pulumi/terraform";

/**
 * atguments required for class
 *
 * s3_bucket: terragrunt s3 state buket id
 *
 */

type bucketArgs = {
  s3_bucket: Input<string>;
}
/**
 * creating class tg_vpc_output to get terragrunt network module vpc output for any account stacks
 * This uses the terraform.state.RemoteStateReference method from @pulumi/terraform module
 */

export class tg_vpc_outputs extends ComponentResource {
  private networkState: terraform.state.RemoteStateReference;

  getOutput(key: string): Output<any> {
    return this.networkState.getOutput(key);
  }

  constructor(name: string, args: bucketArgs, opts?: ComponentResourceOptions) {
    super(`custom:resource:tg_vpc_output`, name, {}, opts);
    const config = new Config("aws");
    const aws_region: Input<string> = config.require("region");
    const aws_profile: Input<string> = config.require("profile");

    this.networkState = new terraform.state.RemoteStateReference(
      "network",
      {
        backendType: "s3",
        bucket: args.s3_bucket,
        key: `terragrunt/${aws_region}/network/vpc/terraform.tfstate`,
        region: aws_region,
        profile: aws_profile
      }
    );
  }
}
