// https://gist.github.com/parafeu/3cf1c52d374a52091a685ce030563411

const plugin = require("tailwindcss/plugin");

module.exports = plugin(function ({ addUtilities, matchUtilities, theme }) {
  const scrollbarTrackColorValue = (value) => ({
    "--scrollbar-track": value,
    "&::-webkit-scrollbar-track": {
      "background-color": value,
    },
  });

  const scrollbarTrackRoundedValue = (value) => ({
    "&::-webkit-scrollbar-track": {
      "border-radius": value,
    },
  });

  const scrollbarThumbColorValue = (value) => ({
    "--scrollbar-thumb": value,
    "&::-webkit-scrollbar-thumb": {
      "background-color": value,
    },
  });

  const scrollbarThumbRoundedValue = (value) => ({
    "&::-webkit-scrollbar-thumb": {
      "border-radius": value,
    },
  });

  const scrollbarCornerColorValue = (value) => ({
    "&::-webkit-scrollbar-corner": {
      "background-color": value,
    },
  });

  const scrollbarCornerRoundedValue = (value) => ({
    "&::-webkit-scrollbar-corner": {
      "border-radius": value,
    },
  });

  addUtilities({
    ".scrollbar": {
      "--scrollbar-thumb": "#cdcdcd",
      "--scrollbar-track": "#f0f0f0",
      "--scrollbar-corner": "#f0f0f0",
      "--scrollbar-width": "17px",
      "scrollbar-color":
        "var(--scrollbar-thumb) var(--scrollbar-track) var(--scrollbar-corner)",
      "&::-webkit-scrollbar": {
        width: "var(--scrollbar-width)",
        height: "var(--scrollbar-width)",
      },
    },
    ".scrollbar-thin": {
      "--scrollbar-width": "8px",
      "scrollbar-width": "thin",
    },
  });

  Object.entries(theme("colors")).forEach(([colorName, color]) => {
    switch (typeof color) {
      case "object":
        matchUtilities(
          {
            [`scrollbar-track-${colorName}`]: (value) =>
              scrollbarTrackColorValue(value),
            [`scrollbar-thumb-${colorName}`]: (value) =>
              scrollbarThumbColorValue(value),
            [`scrollbar-corner-${colorName}`]: (value) =>
              scrollbarCornerColorValue(value),
          },
          {
            values: color,
          }
        );
        break;
      case "function":
        addUtilities({
          [`.scrollbar-track-${colorName}`]: scrollbarTrackColorValue(
            color({})
          ),
          [`.scrollbar-thumb-${colorName}`]: scrollbarThumbColorValue(
            color({})
          ),
          [`scrollbar-corner-${colorName}`]: scrollbarCornerColorValue({}),
        });
        break;
      case "string":
        addUtilities({
          [`.scrollbar-track-${colorName}`]: scrollbarTrackColorValue(color),
          [`.scrollbar-thumb-${colorName}`]: scrollbarThumbColorValue(color),
          [`.scrollbar-corner-${colorName}`]: scrollbarCornerColorValue(color),
        });
        break;
    }
  });

  matchUtilities(
    {
      "scrollbar-track-rounded": (value) => scrollbarTrackRoundedValue(value),
      "scrollbar-thumb-rounded": (value) => scrollbarThumbRoundedValue(value),
      "scrollbar-corner-rounded": (value) => scrollbarCornerRoundedValue(value),
    },
    {
      values: theme("borderRadius"),
    }
  );
});
