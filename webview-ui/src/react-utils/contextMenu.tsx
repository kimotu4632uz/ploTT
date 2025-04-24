import { Menu, MenuItem } from "@mui/material";
import { useState } from "react";

type ContextMenuResult = string | null;

type MenuPos = {
    mouseX: number;
    mouseY: number;
};

type InnerContextMenuProps = {
    onClose: (result: ContextMenuResult) => void;
    pos: MenuPos | null;
    items: string[];
};

const InnerContextMenu = ({ onClose, pos, items }: InnerContextMenuProps) => {
    return (
        <Menu
            data-vscode-context='{"preventDefaultContextMenuItems": true}'
            open={pos !== null}
            onClose={() => onClose(null)}
            anchorReference="anchorPosition"
            anchorPosition={pos !== null ? { top: pos.mouseY, left: pos.mouseX } : undefined}>
            {items.map((item, i) => (
                <MenuItem key={i} onClick={() => onClose(item)} autoFocus={false}>
                    {item}
                </MenuItem>
            ))}
        </Menu>
    );
};

type ContextMenuProps = {
    values: string[];
};

export function useContextMenu(): [
    React.FC<ContextMenuProps>,
    (event: React.MouseEvent<HTMLElement>) => Promise<ContextMenuResult>,
] {
    const [menuPos, setMenuPos] = useState<{
        mouseX: number;
        mouseY: number;
    } | null>(null);
    const [resolve, setResolve] = useState<(value: ContextMenuResult) => void>();

    const onRightClick = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        setMenuPos({
            mouseX: event.clientX + 2,
            mouseY: event.clientY + 6,
        });
        return new Promise<ContextMenuResult>((resolve) => {
            setResolve(() => resolve);
        });
    };

    const onClose = (result: ContextMenuResult) => {
        setMenuPos(null);
        if (resolve) {
            resolve(result);
        }
    };

    // eslint-disable-next-line react/prop-types -- unknown error
    const ContextMenu: React.FC<ContextMenuProps> = ({ values }) => (
        <InnerContextMenu onClose={onClose} pos={menuPos} items={values} />
    );

    return [ContextMenu, onRightClick];
}
