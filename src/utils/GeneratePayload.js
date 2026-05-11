export function generatePayload({
  prompt,
  negativePrompt,
  steps,
  cfg,
  seed,
  sampler,
  width,
  height,
  baseModel,
  loras = [],
  controlNets = [],
  vae,
  imageFiles,
  actionType
}) {
  if (!baseModel || !baseModel.id) {
    console.error("[generatePayload] Model invalid:", baseModel);
    throw new Error("Hãy chọn mẫu tạo hình ảnh!");
  }

  if (!prompt || prompt.trim() === "") {
    console.error("[generatePayload] Prompt is empty");
    throw new Error("Cần nhập mô tả để tạo hình ảnh!");
  }

  const formData = new FormData();

  // Tạo đối tượng JSON chứa tất cả các tham số của 'params'
  // Đảm bảo các tên thuộc tính ở đây khớp với PascalCase của DTO C# của bạn
  const params = {
    BaseModel: {
      Id: String(baseModel.id),
      Name: baseModel.name
    },
    Models: (Array.isArray(loras) ? loras : []).map(lora => ({
      Id: String(lora.id),
      Name: lora.name,
      Value: lora.strength !== undefined ? String(lora.strength) : "1"
    })),
    ControlNets: (Array.isArray(controlNets) ? controlNets : []).map(cn => ({
      Id: String(cn.id),
      Name: cn.name,
      Value: cn.strength !== undefined ? String(cn.strength) : "1"
    })),
    Vae: (
      vae && vae.name && vae.name !== "" ?
        [{
          Id: String(vae.id),
          Name: vae.name
        }] :
        []
    ),
    Prompt: prompt.trim(),
    NegativePrompt: negativePrompt?.trim() || "",
    Height: Number(height) || 512,
    Width: Number(width) || 512,
    ImageCount: 1,
    Steps: Number(steps) || 30,
    CFG: Number(cfg) || 1,
    Seed: seed === "" ? -1 : Number(seed),
    Denoise: 1,
    KSamplerName: sampler || "euler", // KSamplerName để khớp với C#
    Schedule: "simple"
  };

  // Thêm các thuộc tính trực tiếp vào MediaGenerationRequest DTO ở Backend
  // Đảm bảo tên trường khớp với PascalCase của DTO C# của bạn
  formData.append('ActionType', String(actionType)); // '1' nếu ActionType.Txt2Img có giá trị là 1, hoặc 'Txt2Img' nếu dùng StringEnumConverter

  // Thêm chuỗi JSON của params vào FormData
  // Tên trường 'Payload' phải khớp với tên thuộc tính trong DTO C# MediaGenerationFormRequest của bạn
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
          throw new Error("Có lỗi khi phân tích hình ảnh đầu vào!");
        }
      } else {
        formData.append('Images', imageFile);
      }
    })
  }

  return formData;
}