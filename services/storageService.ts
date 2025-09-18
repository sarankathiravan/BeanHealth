import { supabase } from '../lib/supabase'

// Simplified upload function that skips bucket existence check
export const uploadFileToSupabaseSimple = async (file: File, bucket: string = 'medical-records'): Promise<string> => {
    console.log('Starting simplified file upload to Supabase Storage...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        bucket
    });

    // Generate unique file name
    const fileExt = file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const fileName = `${timestamp}-${randomId}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    console.log('Uploading file with path:', filePath);

    // Upload the file directly
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('File uploaded successfully:', uploadData);

    // Get the public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

    if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
    }

    console.log('Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
};

export const uploadFileToSupabase = async (file: File, bucket: string = 'medical-records'): Promise<string> => {
    console.log('Uploading file to Supabase Storage:', file.name);

    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
        console.error('Error accessing storage:', bucketsError);
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

    console.log('Uploading file with path:', filePath);

    // Upload the file
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (uploadError) {
        console.error('Supabase Storage upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    console.log('File uploaded successfully:', uploadData);

    // Get the public URL
    const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadData.path);

    if (!urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
    }

    console.log('Public URL generated:', urlData.publicUrl);
    return urlData.publicUrl;
}

// Function to check if the medical-records bucket exists
export const checkMedicalRecordsBucket = async (): Promise<{ exists: boolean; message: string }> => {
    const bucketName = 'medical-records';
    
    console.log('Checking if bucket exists:', bucketName);
    
    try {
        const { data: buckets, error: listError } = await supabase.storage.listBuckets();
        if (listError) {
            console.error('Error listing buckets:', listError);
            return {
                exists: false,
                message: `Failed to list buckets: ${listError.message}`
            };
        }

        console.log('Available buckets:', buckets?.map(b => ({ name: b.name, public: b.public })));

        const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
        
        if (bucketExists) {
            console.log('✅ Bucket exists:', bucketName);
            return {
                exists: true,
                message: 'medical-records bucket found and ready to use'
            };
        } else {
            console.log('❌ Bucket does not exist:', bucketName);
            return {
                exists: false,
                message: 'medical-records bucket not found. Please create it manually in your Supabase dashboard under Storage > Buckets.'
            };
        }
    } catch (error) {
        console.error('Error checking bucket:', error);
        return {
            exists: false,
            message: `Error checking bucket: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};

// Legacy function name for backward compatibility
export const createMedicalRecordsBucket = checkMedicalRecordsBucket;

// Function to test storage connectivity
export const testStorageConnection = async (): Promise<boolean> => {
    try {
        // Check authentication first
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        console.log('Current auth session:', {
            hasSession: !!session,
            userId: session?.user?.id,
            authError
        });

        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error('Storage connection test failed:', error);
            return false;
        }
        console.log('Storage connection successful. Available buckets:', data?.map(b => b.name));
        return true;
    } catch (error) {
        console.error('Storage connection test error:', error);
        return false;
    }
};

// Function to test direct bucket access
export const testBucketAccess = async (bucketName: string = 'medical-records'): Promise<{ accessible: boolean; message: string }> => {
    try {
        console.log(`Testing direct access to bucket: ${bucketName}`);
        
        // Try to list files in the bucket
        const { data, error } = await supabase.storage
            .from(bucketName)
            .list('', { limit: 1 });
        
        if (error) {
            console.error('Bucket access test failed:', error);
            return {
                accessible: false,
                message: `Cannot access bucket: ${error.message}`
            };
        }
        
        console.log('Bucket access test successful:', data);
        return {
            accessible: true,
            message: 'Bucket is accessible and ready for uploads'
        };
    } catch (error) {
        console.error('Bucket access test error:', error);
        return {
            accessible: false,
            message: `Bucket access test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
};



export const uploadFileToGCS = uploadFileToSupabase;
