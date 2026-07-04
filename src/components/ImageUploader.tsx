import { useRef } from 'react';
import { Image } from 'lucide-react';

interface ImageUploaderProps {
  isDark: boolean;
}

export function ImageUploader({ isDark }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('Image is too large. Please use an image under 1MB to avoid localStorage limits.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const img = `<img src="${base64}" style="max-width:100%; border-radius:0.5rem; margin:0.5rem 0;" />`;
      document.execCommand('insertHTML', false, img);
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be re-uploaded
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
      />
      <button
        onClick={() => inputRef.current?.click()}
        className={`
          p-1.5 rounded-lg transition-colors duration-200 cursor-pointer
          ${
            isDark
              ? 'hover:bg-white/10 text-gray-400 hover:text-gray-200'
              : 'hover:bg-black/5 text-gray-500 hover:text-gray-700'
          }
        `}
        title="Insert Image"
      >
        <Image size={16} />
      </button>
    </>
  );
}
