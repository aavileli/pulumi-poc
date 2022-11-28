import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";


/**
 * vpcOutputs from pulumi terragrunt stacks from their cloud service state file
 */
type vpcOutputs = {
    vpc_id: pulumi.Output<any>
    vpc_private_subnets : pulumi.Output<any>
    vpc_public_subnets:  pulumi.Output<any>
    vpc_cidr_block : pulumi.Output<any>
}


/**
 * get vpc details from pulumi bgl_terragrunt_vpc stack. This is to demonstrate cross stack resource sharing
 * please note the namespace format org/project/stack. ashley is the org, project is bgl_terragrunt_vpc and stack is dev. there are other
 * stacks for differnet enivornments prod, sgprod, etc
 */
export function vpcOutputs(stackRef:string):vpcOutputs {

    const vpc_stackOuputs = new pulumi.StackReference(stackRef);
    return {
        vpc_id: vpc_stackOuputs.getOutput("vpcID"),
        vpc_private_subnets : vpc_stackOuputs.getOutput("private_subnets"),
        vpc_public_subnets:  vpc_stackOuputs.getOutput("vpc_public_subnets"),
        vpc_cidr_block : vpc_stackOuputs.getOutput("vpc_cidr_block")
    }

}

/**
 * bgl secops policy
 */
 const secOpsPolicy = new pulumi.Config().requireSecret("secOpsPolicy")


/**
 * 
 * @param service is the principal identity that will assume role
 * @returns aws.iam.role with permission boundary added so other policies can be attached
 */
export function getServiceRole(service:string): aws.iam.Role {
    return new aws.iam.Role("lambda", {
        assumeRolePolicy: aws.iam.assumeRolePolicyForPrincipal({
          Service: service,
        }),
        permissionsBoundary: secOpsPolicy,
      },
      )

}