import { createClient } from "@/utils/supabase/client";
import { Certificate, CreateCertificateInput } from "@/types/certificate";

const supabase = createClient();

export async function getCertificates(): Promise<Certificate[]> {
    const { data, error } = await supabase
        .from("certificates")
        .select(`
      *,
      event:events(*)
    `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching certificates:", error);
        throw new Error(error.message);
    }

    return data || [];
}

export async function createCertificate(
    input: CreateCertificateInput,
    file: File
): Promise<Certificate> {
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "pdf";
    const sanitizedTitle = input.file_name.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const storageFileName = `${sanitizedTitle}_${Date.now()}.${fileExt}`;
    const filePath = `certificates/${storageFileName}`;

    // 1. Upload file to Supabase storage bucket 'certificates'
    const { error: uploadError } = await supabase.storage
        .from("certificates")
        .upload(filePath, file, {
            contentType: file.type,
            upsert: true,
        });

    if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // 2. Get Public URL
    const { data: publicUrlData } = supabase.storage
        .from("certificates")
        .getPublicUrl(filePath);

    // 3. Insert record into certificates table
    const { data, error: insertError } = await supabase
        .from("certificates")
        .insert({
            event_id: input.event_id,
            file_name: input.file_name,
            file_url: publicUrlData.publicUrl,
            size_bytes: file.size,
        })
        .select(`
      *,
      event:events(*)
    `)
        .single();

    if (insertError) {
        throw new Error(`Failed to save certificate record: ${insertError.message}`);
    }

    return data;
}

export async function updateCertificate(
    id: string,
    input: Partial<CreateCertificateInput>,
    file?: File | null
): Promise<Certificate> {
    let updateData: any = {
        ...(input.event_id && { event_id: input.event_id }),
        ...(input.file_name && { file_name: input.file_name }),
    };

    // If a new file is provided, upload it and update storage info
    if (file) {
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "pdf";
        const sanitizedTitle = (input.file_name || "file").replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
        const storageFileName = `${sanitizedTitle}_${Date.now()}.${fileExt}`;
        const filePath = `certificates/${storageFileName}`;

        const { error: uploadError } = await supabase.storage
            .from("certificates")
            .upload(filePath, file, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) {
            throw new Error(`Failed to upload replacement file: ${uploadError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from("certificates")
            .getPublicUrl(filePath);

        updateData.file_url = publicUrlData.publicUrl;
        updateData.size_bytes = file.size;
    }

    // Update record in database
    const { data, error: updateError } = await supabase
        .from("certificates")
        .update(updateData)
        .eq("id", id)
        .select(`
      *,
      event:events(*)
    `)
        .single();

    if (updateError) {
        throw new Error(`Failed to update certificate record: ${updateError.message}`);
    }

    return data;
}

export async function deleteCertificate(id: string, fileUrl?: string): Promise<void> {
    // Optional: Extract path and delete file from storage if needed
    if (fileUrl) {
        try {
            const urlParts = fileUrl.split("/certificates/");
            if (urlParts.length > 1) {
                const filePath = urlParts[1];
                await supabase.storage.from("certificates").remove([filePath]);
            }
        } catch (err) {
            console.warn("Could not remove file from storage, deleting row anyway:", err);
        }
    }

    // Delete row from database
    const { error } = await supabase.from("certificates").delete().eq("id", id);

    if (error) {
        throw new Error(`Failed to delete certificate: ${error.message}`);
    }
}