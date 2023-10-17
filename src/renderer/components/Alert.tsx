export interface AlertProps {
  message: string;
}
export default function Alert(props: AlertProps) {
  const { message } = props;
  return (
    <div className="bg-red-200 p-4 rounded-lg flex justify-center my-2 transition-all">
      {message}
    </div>
  );
}
