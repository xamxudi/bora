export function generateVideoPayload({
  prompt,
  negativePrompt,
  steps,
  cfg,
  seed,
  resolution,
  duration,
  fps,
  quality,
  baseModel,
  loras = [],
  imageFiles,
  actionType
}) {

  if (!baseModel || !baseModel.id) {
    console.error("[generateVideoPayload] Model invalid:", baseModel);
    throw new Error("Model object is missing or invalid!");
  }

  if (!prompt || prompt.trim() === "") {
    console.error("[generateVideoPayload] Prompt is empty");
    throw new Error("Prompt cannot be empty!");
  }

  const formData = new FormData();

  // 1. Thêm các thuộc tính đơn lẻ vào FormData
  // Đảm bảo tên trường khớp với tên thuộc tính trong C# DTO (thường là PascalCase)
  formData.append('ActionType', String(actionType)); // Cần là chuỗi
  let height = 512, width = 512;
  resolution.split("x").forEach((value, index) => {
    if (index)
      width = value;
    else
      height = value;
  });
  // Tạo một đối tượng riêng cho 'params' để có thể stringify
  const params = {
    baseModel: {
      Id: String(baseModel.id),
      Name: baseModel.name
    },
    models: (Array.isArray(loras) ? loras : []).map(lora => ({
      Id: String(lora.id),
      Name: lora.name,
      Value: lora.strength !== undefined ? String(lora.strength) : "1"
    })),
    prompt: prompt.trim(),
    negativePrompt: negativePrompt?.trim() || "",
    steps: Number(steps) || 30,
    cfg: Number(cfg) || 1,
    seed: seed === "" ? -1 : Number(seed),
    height: Number(height) || 512,
    width: Number(width) || 512,
    duration: Number(duration) || 5,
    fps: Number(fps) || 16,
    quality: quality || "Standard",
    schedule: "simple"
    // KHÔNG bao gồm 'images' hoặc 'imageFile' TRỰC TIẾP TẠI ĐÂY
    // Nếu bạn muốn gửi metadata của ảnh, bạn có thể thêm nó vào đây
    // nhưng bản thân file sẽ được thêm riêng vào FormData
  };

  // Thêm chuỗi JSON của params vào FormData
  // Tên trường 'Payload' hoặc 'ParamsJson' phải khớp với tên thuộc tính bạn dùng ở backend C#
  formData.append('Payload', JSON.stringify(params));

  // 2. Thêm File object vào FormData
  imageFiles = imageFiles.filter(Boolean);
  if (imageFiles && imageFiles.length > 0) {
    imageFiles.forEach((imageFile) => {
      // Đảm bảo imageFile là một File object hợp lệ
      if (!(imageFile instanceof File)) {
        if (imageFile.file instanceof File) {
          formData.append('Images', imageFile.file);
        } else if (imageFile.base64 != null) {
          const base64Data = imageFile.base64.split(',')[1];
          const contentType = imageFile.base64.split(',')[0].split(':')[1].split(';')[0];

          // Chuyển base64 thành Blob
          const byteCharacters = atob(base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: contentType });

          // Tạo một File object từ Blob. Cần một tên file!
          // Có thể lấy tên từ URL ban đầu nếu có, hoặc tạo tên mặc định.
          const fileName = `uploaded_image.${contentType.split('/')[1] || 'png'}`; // Ví dụ: image/png -> png

          formData.append('Images', new File([blob], fileName, { type: contentType }));
        } else {
          throw new Error("imageFile must be a File object or an object containing a File object in its 'file' property.");
        }
      } else {
        formData.append('Images', imageFile);
      }
    })
  }

  return formData;
}