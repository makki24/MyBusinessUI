import axios from "../../services/NetworkInterceptor";

const uploadImgtoImgBB = async (imageUri: string) => {
    try {
        const apiUrl = '/api/upload/uploadImage'
        // Convert the image URI to Blob
        const response = await fetch(imageUri);

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const imageBlob = await response.blob();

        // Convert the Blob to a base64-encoded string
        const reader = new FileReader();
        const base64Image = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(imageBlob);
        });

        // Remove unnecessary prefixes from base64 string
        const base64String = base64Image.replace(/^data:image\/\w+;base64,/, '');

        const formData = new FormData();
        formData.append('image', base64String);

        const axiosConfig = {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            transformRequest: [(data) => data],
        };

        const axiosResponse = await axios.post(apiUrl, formData, axiosConfig);

        if (axiosResponse.status !== 200) {
            console.log("after response", axiosResponse);
            throw new Error('Image upload failed');
        }

        const result = axiosResponse.data;

        if (result.data && result.data.url) {
            return result.data.url;
        } else {
            throw new Error('Invalid response from ImgBB');
        }
    } catch (error) {
        console.log("after catch", error);
        throw new Error(`Failed to upload image: ${error.message}`);
    }
};


export default uploadImgtoImgBB;
