import { RiTimeLine } from 'react-icons/ri'

export default function FeaturePlaceholder({ title, description, icon: Icon }) {
  const DisplayIcon = Icon || RiTimeLine
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4">
        <DisplayIcon size={24} className="text-gray-400" />
      </div>
      <h3 className="text-gray-600 font-semibold text-base mb-1">
        {title || 'Fitur dalam pengembangan'}
      </h3>
      <p className="text-gray-400 text-sm max-w-xs">
        {description || 'Fitur ini sedang dalam tahap pengembangan dan akan segera tersedia.'}
      </p>
    </div>
  )
}
