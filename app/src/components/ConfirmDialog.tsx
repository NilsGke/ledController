import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import "../styles/confirmDialog.sass";

type option = {
    name: string;
    function: () => void;
};

type props = {
    open: boolean;
    text: string;
    options: option[];
    close: () => void;
};

const ConfirmDialog: React.FC<props> = ({ open, text, options, close }) => {
    return (
        <Dialog
            open={open}
            onClose={close}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
        >
            <DialogTitle id="alert-dialog-title">{"Are you sure you want to save?"}</DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">{text}</DialogContentText>
            </DialogContent>
            <DialogActions>
                {options.map((option) => (
                    <Button key={option.name} onClick={option.function}>
                        {option.name}
                    </Button>
                ))}
            </DialogActions>
        </Dialog>
    );
};
export default ConfirmDialog;
