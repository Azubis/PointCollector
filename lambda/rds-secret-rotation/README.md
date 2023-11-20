# Secret Rotation Function

The deployment package of this function was obtained by creating a secret rotation via AWS Console and then exporting the code of the Lambda function that AWS created. It works for all secrets, includes the necessary dependencies, and is based on [AWS secret rotation templates](https://docs.aws.amazon.com/secretsmanager/latest/userguide/reference_available-rotation-templates.html#sar-template-postgre-singleuser).

## Modifications

A modification was made (lines 206-209) to support password hashing using MD5, in order to support Quicksight connection that (at the moment of writing) does not work with SCRAM-SHA-256 hashed passwords

See:

- https://repost.aws/questions/QUH9WSQIV7Q026ODqYS7p2HQ/rds-data-source-validation-timeout-in-amazon-quicksight
- https://stackoverflow.com/questions/17429040/creating-user-with-encrypted-password-in-postgresql

Modified code:

    password = pending_dict['password']
    if "hashAlgorithm" in pending_dict and pending_dict["hashAlgorithm"] == "md5":
        logger.info("set password as md5 as specified in secret")
        password = "md5" + hashlib.md5((password + pending_dict["username"]).encode("utf-8")).hexdigest()