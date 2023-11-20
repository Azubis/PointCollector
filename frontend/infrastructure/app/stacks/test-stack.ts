import {Construct} from 'constructs';
import {S3Bucket} from '@cdktf/provider-aws/lib/s3-bucket';
import {BaseStack} from './base-stack';
import {prefixedName} from '../../common/constants';

/**
 * Hier können wier cdktf Kontruktion ausprobieren
 */
export class TestStack extends BaseStack {
    constructor(scope: Construct, name: string) {
        super(scope, name);

        new S3Bucket(this, prefixedName('test-stack'), {
            bucket: prefixedName('test-s3-bucket'),
        })
    }
}
