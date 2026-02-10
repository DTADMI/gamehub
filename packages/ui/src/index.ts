// @gamehub/ui barrel – re-exports UI primitives from game-platform
// so internal components can `import { Button } from "@gamehub/ui"`

export { Button, buttonVariants } from "../../game-platform/src/components/ui/button";
export { Badge, badgeVariants } from "../../game-platform/src/components/ui/badge";
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../game-platform/src/components/ui/card";
export { Input } from "../../game-platform/src/components/ui/input";
export { Label } from "../../game-platform/src/components/ui/label";
export { Progress } from "../../game-platform/src/components/ui/progress";
export { Separator } from "../../game-platform/src/components/ui/separator";
export { Skeleton } from "../../game-platform/src/components/ui/skeleton";
export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../game-platform/src/components/ui/tabs";
export {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../game-platform/src/components/ui/alert";

// ThemeProvider
export { ThemeProvider } from "../../game-platform/src/components/ThemeProvider";

// cn utility
export { cn } from "../../game-platform/src/lib/utils";
