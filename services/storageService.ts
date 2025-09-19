import { supabase } from '../lib/supabase'

// Simplified upload function that skips bucket existence check
export const uploadFileToSupabaseSimple = async (file: File, bucket: string = 'medical-records'): Promise<string> => {
    // Generate unique file name
    const fileExt = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload the file directly
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

    if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
    }

    return urlData.publicUrl;
};

export const uploadFileToSupabase = async (file: File, bucket: string = 'medical-records'): Promise<string> => {
    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
        throw new Error(`Failed to access storage: ${bucketsError.message}`);
    }

    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
        // Try direct bucket access as fallback
        try {
            const { error: testError } = await supabase.storage
                .from(bucket)
                .list('', { limit: 1 });
            
            if (testError) {
                throw new Error(`Storage bucket '${bucket}' does not exist or is not accessible. Please verify it exists in your Supabase dashboard.`);
            }
        } catch (directAccessError) {
            throw new Error(`Storage bucket '${bucket}' does not exist. Please create it in your Supabase dashboard.`);
        }
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

    if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
    }

    return urlData.publicUrl;
}

// Function to check if the medical-records bucket exists
export const checkMedicalRecordsBucket = async (): Promise<{ exists: boolean; message: string }> => {
    const bucketName = 'medical-records';
    
    try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) {
            return {
                exists: false,
                message: `Failed to list buckets: ${listError.message}`
            };
        }

        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
        
        if (bucketExists) {
            return {
                exists: true,
                message: 'medical-records bucket found and ready to use'
            };
        } else {
            return {
                exists: false,
                message: 'medical-records bucket not found. Please create it manually in your Supabase dashboard under Storage > Buckets.'
            };
        }
    } catch (error) {
        return {
            exists: false,
            message: `Error checking bucket: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

// Legacy function name for backward compatibility
export const createMedicalRecordsBucket = checkMedicalRecordsBucket;

// Function to delete a file from Supabase storage
export const deleteFileFromSupabase = async (fileUrl: string, bucket: string = 'medical-records'): Promise<boolean> => {
    try {
        // Extract the file path from the URL
        // URL format: https://[project].supabase.co/storage/v1/object/public/[bucket]/[path]
        const urlParts = fileUrl.split('/');
        const bucketIndex = urlParts.findIndex(part => part === bucket);
        
        if (bucketIndex === -1 || bucketIndex >= urlParts.length - 1) {
            return false;
        }
        
        // Get the path after the bucket name
        const filePath = urlParts.slice(bucketIndex + 1).join('/');
        
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);
        
        if (error) {
            return false;
        }
        
        return true;
    } catch (error) {
        return false;
    }
};

// Function to test storage connectivity
export const testStorageConnection = async (): Promise<boolean> => {
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            return false;
        }
        return true;
    } catch (error) {
        return false;
    }
};

// Function to test direct bucket access
export const testBucketAccess = async (bucketName: string = 'medical-records'): Promise<{ accessible: boolean; message: string }> => {
    try {
        // Try to list files in the bucket
        const { data, error } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1 });
        
        if (error) {
            return {
                accessible: false,
                message: `Cannot access bucket: ${error.message}`
            };
        }
        
        return {
            accessible: true,
            message: 'Bucket is accessible and ready for uploads'
        };
    } catch (error) {
        return {
            accessible: false,
            message: `Bucket access test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

export const uploadFileToGCS = uploadFileToSupabase;