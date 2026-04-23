import {createContext, useState} from 'react';

export const StyleContext = createContext();

function StyleContextProvider({children}) {
    const [theme, setTheme] = useState(false);
    return (
        <StyleContext.Provider value={{theme, setTheme}}>
            {children}
        </StyleContext.Provider>
    );
}
export default StyleContextProvider;