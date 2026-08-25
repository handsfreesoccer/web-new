import {
	ListObjectsV2Command,
	type ListObjectsV2CommandOutput,
	S3Client,
} from "@aws-sdk/client-s3";
import { getR2Config } from "#/server/r2-config";

let client: S3Client | null = null;

const getClient = () => {
	const config = getR2Config();
	if (!config) return null;

	client ??= new S3Client({
		region: "auto",
		endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey,
		},
	});

	return client;
};

export type R2ObjectSummary = NonNullable<
	ListObjectsV2CommandOutput["Contents"]
>[number];

export async function listR2Objects(prefix: string): Promise<R2ObjectSummary[]> {
	const config = getR2Config();
	const s3 = getClient();
	if (!config || !s3) return [];

	const normalizedPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
	const objects: R2ObjectSummary[] = [];
	let continuationToken: string | undefined;

	do {
		const response = await s3.send(
			new ListObjectsV2Command({
				Bucket: config.bucketName,
				Prefix: normalizedPrefix,
				ContinuationToken: continuationToken,
			}),
		);

		if (response.Contents?.length) {
			objects.push(...response.Contents);
		}

		continuationToken = response.IsTruncated
			? response.NextContinuationToken
			: undefined;
	} while (continuationToken);

	return objects.filter(
		(object) => object.Key && !object.Key.endsWith("/") && object.Size !== 0,
	);
}
