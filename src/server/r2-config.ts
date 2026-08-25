export const R2_IMAGES_PREFIX = "images";
export const R2_VIDEOS_PREFIX = "videos";

export type R2Config = {
	accountId: string;
	accessKeyId: string;
	secretAccessKey: string;
	bucketName: string;
	publicUrl: string;
};

const trimSlash = (value: string) => value.replace(/\/+$/, "");

export const isR2Configured = () => getR2Config() !== null;

const readEnv = (key: string) => {
	const value = process.env[key]?.trim();
	return value ? value : null;
};

export function getR2Config(): R2Config | null {
	const accountId = readEnv("R2_ACCOUNT_ID");
	const accessKeyId = readEnv("R2_ACCESS_KEY_ID");
	const secretAccessKey = readEnv("R2_SECRET_ACCESS_KEY");
	const bucketName = readEnv("R2_BUCKET_NAME");
	const publicUrl = readEnv("R2_PUBLIC_URL");

	if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicUrl) {
		return null;
	}

	return {
		accountId,
		accessKeyId,
		secretAccessKey,
		bucketName,
		publicUrl: trimSlash(publicUrl),
	};
}

export function getR2PublicUrl(key: string) {
	const config = getR2Config();
	if (!config) return null;
	return `${config.publicUrl}/${key.replace(/^\/+/, "")}`;
}
