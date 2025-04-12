// Import necessary components from @starwind/react
import { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@starwind/react"; 
 
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };

// Assign the object to a variable first
const CardComponents = {
  Root: Card,
  Header: CardHeader,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
};

export default CardComponents;
