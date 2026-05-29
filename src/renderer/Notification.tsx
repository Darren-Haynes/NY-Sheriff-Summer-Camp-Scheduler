interface ToggleProps {
  isVisible: string;
  onToggle: React.MouseEventHandler<HTMLButtonElement>;
  message: string;
}

const NotificationBox: React.FC<ToggleProps> = ({ isVisible, onToggle, message }) => {
  if (isVisible !== 'notification-box') {
    return null;
  }

  return (
    <div id="notification-box" className="fade-out-5s-stay">
      <p>{message}</p>
    </div>
  );
};

export default NotificationBox;
