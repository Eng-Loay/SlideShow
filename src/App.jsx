import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";

export default function ImageSliderUploadPage() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [images]);

  const fetchImages = async () => {
    try {
      const res = await axios.get(
        "https://fineartsback-production.up.railway.app/api/images"
      );
      setImages(res.data);
    } catch (err) {
      console.error("Error loading images", err);
    }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      await axios.post(
        "https://fineartsback-production.up.railway.app/api/upload",
        formData
      );
      fetchImages();
      Swal.fire({
        icon: "success",
        title: "Upload Successful",
        text: "Your image has been uploaded!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const getVisibleImages = () => {
    const total = images.length;
    if (total <= 6) return images;
    const start = currentIndex;
    const end = (start + 6) % total;
    if (start < end) return images.slice(start, end);
    return [...images.slice(start), ...images.slice(0, end)];
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) handleUpload(file);
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center px-4 py-8"
      style={{
        backgroundImage:
          "url(https://res.cloudinary.com/dzx8ljs2m/image/upload/v1747610810/web_lqittf.png)",
      }}
    >
      {/* Image Grid */}
      <div className="flex justify-center items-center gap-6 flex-wrap mb-10">
        {getVisibleImages().map((img, index) => (
          <img
            key={index}
            src={img.url}
            alt=""
            className="h-64 w-48 object-cover rounded-lg border-4 border-white shadow-xl"
          />
        ))}
      </div>

      {/* Upload Button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        onClick={handleButtonClick}
        className="bg-[#dcf238] text-black font-bold px-6 py-3 rounded-xl shadow-lg hover:brightness-110 disabled:opacity-50 cursor-pointer transition duration-300"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </div>
  );
}
