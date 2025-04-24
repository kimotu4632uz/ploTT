import {
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Stack,
    Typography,
} from "@mui/material";
import * as d3 from "d3";
import { useState } from "react";

import CoreDetail from "./CoreDetail";
import Overview from "./Overview";
import { ColorBarInfo } from "./react-utils/types";
import { UNFOLD_DESC } from "./tensortrain/constants";
import { GenericTensorTrain, TTmat } from "./tensortrain/TT";
import { UnfoldDir } from "./tensortrain/types";

type PageProps<T extends UnfoldDir> = {
    tt: GenericTensorTrain<T>;
    title: string;
};

const Page = <T extends UnfoldDir>({ tt, title }: PageProps<T>) => {
    const [unfold, setUnfold] = useState(tt.defaultUnfold);
    const [strict, setStrict] = useState(false);
    const [mat, setMat] = useState<TTmat>(tt.matricize(unfold, strict));
    const [selected, setSelected] = useState<number | null>(null);

    let min = Number.MAX_VALUE,
        max = Number.MIN_VALUE;

    for (let i = 0; i < tt.cores.length; i++) {
        const core = tt.cores[i];
        min = Math.min(min, d3.min(core.data)! as unknown as number);
        max = Math.max(max, d3.max(core.data)! as unknown as number);
    }

    const vmax = Math.max(Math.abs(min), Math.abs(max));

    const i0 = d3.interpolate("steelblue", "gainsboro");
    const i1 = d3.interpolate("gainsboro", "brown");
    const color = d3
        .scaleSequential((t) => (t < 0.5 ? i0(2 * t) : i1(2 * (t - 0.5))))
        .domain([-vmax, vmax]);

    const colorinfo: ColorBarInfo = { min: -vmax, max: vmax, color };

    const handleUnfold = (event: SelectChangeEvent<T>) => {
        const val = event.target.value as T;
        setUnfold(val);
        setMat(tt.matricize(val, strict));
    };

    const handleStrictMode = (event: React.ChangeEvent<HTMLInputElement>) => {
        const val = event.target.checked;
        setStrict(val);
        setMat(tt.matricize(unfold, val));
    };

    return (
        <Stack spacing={3}>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Typography variant="h3">{title.length > 0 ? "Name: " + title : ""}</Typography>
                <Stack
                    direction="row"
                    spacing={2}
                    justifyContent="space-between"
                    alignItems="center">
                    <Typography variant="body1">Unfold as</Typography>
                    <FormControl>
                        <Select value={unfold} onChange={handleUnfold}>
                            {tt.availUnfold.map((value, i) => (
                                <MenuItem key={i} value={value}>
                                    {UNFOLD_DESC[value]}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={<Checkbox checked={strict} onChange={handleStrictMode} />}
                        label="Strict mode"
                    />
                </Stack>
            </Stack>

            <Overview tt={mat} onClick={setSelected} colorInfo={colorinfo} />
            <Divider />
            <CoreDetail tt={mat} index={selected} colorInfo={colorinfo} />
        </Stack>
    );
};

export default Page;
