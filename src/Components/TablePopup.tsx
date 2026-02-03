import React from "react";
import { Modal, Box, Title, Group } from "@mantine/core";

// Define TableData locally to avoid circular imports
interface TableStyle {
  borderColor: string;
  headerBgColor: string;
  headerTextColor: string;
  evenRowBgColor: string;
  oddRowBgColor: string;
}

interface TableData {
  headers: string[];
  rows: string[][];
  style: TableStyle;
}

interface TablePopupProps {
  opened: boolean;
  onClose: () => void;
  table: TableData | null;
}

export const TablePopup: React.FC<TablePopupProps> = ({ opened, onClose, table }) => {
  if (!table) return null;

  // Use the table's own colors as set by the creator
  const colors = table.style;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group justify="space-between" w="100%">
          <Title order={4} style={{ color: colors.headerTextColor }}>
            📊 Table View
          </Title>
        </Group>
      }
      centered
      size="auto"
      styles={{
        content: {
          background: colors.evenRowBgColor,
          border: `2px solid ${colors.borderColor}`,
        },
        header: {
          background: colors.headerBgColor,
          borderBottom: `1px solid ${colors.borderColor}`,
        },
        title: {
          width: "100%",
        },
        close: {
          color: colors.headerTextColor,
        },
      }}
    >
      <Box style={{ overflowX: "auto", padding: "8px 0" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            minWidth: 300,
            border: `1px solid ${colors.borderColor}`,
          }}
        >
          <thead>
            <tr style={{ background: colors.headerBgColor }}>
              {table.headers.map((header, i) => (
                <th
                  key={i}
                  style={{
                    padding: "10px 16px",
                    color: colors.headerTextColor,
                    border: `1px solid ${colors.borderColor}`,
                    textAlign: "left",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr
                key={ri}
                style={{
                  background: ri % 2 === 0 ? colors.evenRowBgColor : colors.oddRowBgColor,
                }}
              >
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: "8px 16px",
                      color: "#e5e7eb",
                      border: `1px solid ${colors.borderColor}`,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Modal>
  );
};

export default TablePopup;
