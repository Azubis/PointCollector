import {EfsFileSystem} from '@cdktf/provider-aws/lib/efs-file-system';
import {Construct} from 'constructs'
import {EfsBackupPolicy} from '@cdktf/provider-aws/lib/efs-backup-policy';
import {BaseStack} from './base-stack';
import {prefixedName} from '../../common/constants';

export class StorageStack extends BaseStack {
    readonly efsStorageId: string = "";

    constructor(scope: Construct, name: string) {
        super(scope, name)

        const efs = new EfsFileSystem(this, prefixedName("efs"), {
            //vpc: props.vpc,
            creationToken: prefixedName("efs"),
            encrypted: true,
            lifecyclePolicy: [
                {
                    transitionToIa: "AFTER_90_DAYS",
                },
            ],
            tags: {
                Name: prefixedName("efs")
            },
        });

        new EfsBackupPolicy(this, prefixedName("backup-policy"), {
            backupPolicy: {
                status: "ENABLED",
            },
            fileSystemId: efs.id,
        });

        this.efsStorageId = efs.id
    }
}
