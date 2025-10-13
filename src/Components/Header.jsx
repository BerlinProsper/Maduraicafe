
import  React ,{useEffect }from "react";
import { useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { useMyContext } from "../Contexts/myContext";
export default function Header() {
  const navigate = useNavigate();
  const { fetchServices, addCheckList, inventory, checkingDatabase } = useMyContext();

  useEffect(() => {
    fetchServices();
  }, []);
  useEffect(() => {
    (async () => {
      await addCheckList();
    })();
  }, [inventory]);

  const handleNavigate = (path) => {
    navigate(path);
    handleDrawerClose();
  };

  return (
    <AppBar
      position="static"
      width="100%"
      sx={{
        backgroundColor: '#633b11',  // beige background
        boxShadow: "0 2px 8px rgba(102, 73, 49, 0.15)" // subtle shadow with dark brown tint
      }}
    >
      <Toolbar>
        {/* Logo Button */}
<IconButton
  size="large"
  edge="start"
  aria-label="menu"
  onClick={() => handleNavigate("/")}
  sx={{
    mr: 2,
    color: '#633b11',  // dark brown icon color
    padding: 0,
    "&:hover": { backgroundColor: "transparent" } // no highlight on hover
  }}
>
  <img
    src="/logo.png"
    alt="Logo"
    style={{
      height: 32,
      width: 32, // make width equal to height for a circle
      marginRight: 8,
      borderRadius: '50%', // makes it a circle
      objectFit: 'cover' // ensure image covers the container without distortion
    }}
  />
</IconButton>

        <Typography
          variant="h6"
          component="div"
          onClick={() => handleNavigate("/")}
          sx={{
            flexGrow: 1,
            fontFamily: "'Dancing Script', cursive",
            color: '#e7b253',
            cursor: "pointer",
            userSelect: "none",
            fontWeight: 700,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.6rem' }, // responsive font size
            transition: "color 0.3s ease",
            "&:hover": {
              color: "#a67b5b"
            }
          }}
        >
Madurai Cafe        </Typography>

   

      </Toolbar>


    </AppBar>
  );
}
