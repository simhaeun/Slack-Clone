const SET_THEME = "SET_THEME";

export const setTheme = (mainTheme, subTheme) => ({
  type: SET_THEME,
  mainTheme,
  subTheme,
});

const initialState = { 
  mainTheme: "linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)", 
  subTheme: "linear-gradient(to top, #f3e7e9 0%, #e3eeff 99%, #e3eeff 100%)" 
};

const themeReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_THEME:
      return {
        mainTheme: action.mainTheme,
        subTheme: action.subTheme,
      };
    default:
      return state;
  }
};

export default themeReducer;