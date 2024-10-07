import { createTheme, MantineColorsTuple } from "@mantine/core";

const orange: MantineColorsTuple = [
  "#fff5e6",
  "#ffe8cc",
  "#ffd199",
  "#ffb85f",
  "#ffa033",
  "#ff8c14",
  "#ff7c00",
  "#e06a00",
  "#c65b00",
  "#ab4b00",
];

export const theme = createTheme({
  primaryColor: "orange",
  colors: {
    orange,
  },
});
