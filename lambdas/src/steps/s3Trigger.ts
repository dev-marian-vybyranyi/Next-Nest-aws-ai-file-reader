import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn';

const sfn = new SFNClient({ region: process.env.AWS_REGION ?? 'us-east-1' });

export async function handler(event: any) {
  console.log('S3 trigger event:', JSON.stringify(event));

  for (const record of event.Records) {
    const s3Key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
    console.log('New file uploaded:', s3Key);

    const parts = s3Key.split('/');
    const email = parts[1];
    const fileIdWithExt = parts[2];
    const fileId = fileIdWithExt.replace('.pdf', '');

    console.log(`Starting pipeline for fileId: ${fileId}, email: ${email}`);

    await sfn.send(
      new StartExecutionCommand({
        stateMachineArn: process.env.STATE_MACHINE_ARN,
        name: `execution-${fileId}`,
        input: JSON.stringify({ fileId, s3Key, email }),
      }),
    );

    console.log(`Step Functions started for fileId: ${fileId}`);
  }
}