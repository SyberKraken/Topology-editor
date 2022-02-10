import AddCircleIcon from '@mui/icons-material/AddCircle';
import NavItem from './NavItem';

function Header() {
  return <header>
    <nav>
      <NavItem icon={<AddCircleIcon/>} label={"add item"} />
    </nav>
  </header>
}

export default Header;
