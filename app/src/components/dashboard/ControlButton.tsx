type props = {
    active: boolean;
    activeIcon: JSX.Element | JSX.Element;
    inactiveIcon: JSX.Element | JSX.Element;
    onClick: () => void;
};

const ControlButton: React.FC<props> = ({
    active,
    onClick,
    activeIcon,
    inactiveIcon,
}) => {
    return (
        <button className="controlButton" onClick={onClick}>
            {active ? activeIcon : inactiveIcon}
        </button>
    );
};

export default ControlButton;

//TODO: decide if ill keep this and maybe use it or use toggles
