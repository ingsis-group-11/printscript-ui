import {
    Box,
    Button,
    IconButton,
    InputBase,
    styled,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow
} from "@mui/material";
import { Snippet } from "../../types/Snippet.ts";
import { Add, Search } from "@mui/icons-material";
import { SnippetRow } from "./SnippetRow.tsx";
import { AddSnippetModal } from "./AddSnippetModal.tsx";
import { useState } from "react";

type SnippetTableProps = {
    handleClickSnippet: (id: string) => void;
    snippets: Snippet[];
}

export const SnippetTable = (props: SnippetTableProps) => {
    const { snippets, handleClickSnippet } = props;
    const [addModalOpened, setAddModalOpened] = useState(false);
    return (
        <>
            <Box display="flex" flexDirection="row" justifyContent="space-between">
                <Box sx={{ background: 'white', width: '30%', display: 'flex' }}>
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search Snippet"
                        inputProps={{ 'aria-label': 'search' }}
                    />
                    <IconButton type="button" sx={{ p: '10px' }} aria-label="search">
                        <Search />
                    </IconButton>
                </Box>
                <Button variant="contained" disableRipple sx={{ boxShadow: 0 }} onClick={() => setAddModalOpened(true)}>
                    <Add />
                    Add Snippet
                </Button>
            </Box>
            <Table size="medium" sx={{ borderSpacing: "0 10px", borderCollapse: "separate" }}>
                <TableHead>
                    <TableRow sx={{ fontWeight: 'bold' }}>
                        <StyledTableCell sx={{ fontWeight: "bold" }}>Name</StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: "bold" }}>Language</StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: "bold" }}>Author</StyledTableCell>
                        <StyledTableCell sx={{ fontWeight: "bold" }}>Conformance</StyledTableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {snippets && snippets.map((snippet) => (
                        <SnippetRow onClick={() => handleClickSnippet(snippet.id)} key={snippet.id} snippet={snippet} />
                    ))}
                </TableBody>
            </Table>
            <AddSnippetModal open={addModalOpened} onClose={() => setAddModalOpened(false)} />
        </>
    )
}


export const StyledTableCell = styled(TableCell)`
  border: 0;
  align-items: center;
`
