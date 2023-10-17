export interface TagProps<T> {
  name: string;
  data: T;
  selected: boolean;
  onClick: (data: T) => void;
}
export default function Tag<T>(prop: TagProps<T>) {
  const { name, data, onClick, selected } = prop;
  return (
    <button
      type="button"
      className={`text-gray-800 hover:bg-gray-400 ${
        selected ? 'bg-gray-400' : 'bg-gray-200'
      } px-4 py-1 rounded-lg inline-flex items-center text-sm transition-colors `}
      onClick={() => {
        onClick(data);
      }}
    >
      {name}
    </button>
  );
}
