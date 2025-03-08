"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  DialogClose,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Ce composant Drawer est une implémentation personnalisée utilisant Dialog de shadcn/ui
 * comme base. Il simule un tiroir qui s'ouvre depuis le bas de l'écran.
 */

const drawerVariants = cva(
  "fixed inset-x-0 bottom-0 z-50 flex h-auto max-h-[90vh] flex-col rounded-t-[10px] border bg-background",
  {
    variants: {
      size: {
        default: "max-h-[85vh]",
        sm: "max-h-[40vh]",
        lg: "max-h-[95vh]",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

interface DrawerProps extends React.ComponentPropsWithoutRef<typeof Dialog>, VariantProps<typeof drawerVariants> {
  shouldScaleBackground?: boolean;
  className?: string;
}

// Correction : Utilisation de forwardRef pour Dialog
const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(({ children, ...props }, ref) => (
  <Dialog {...props}>
    <div ref={ref}>{children}</div>
  </Dialog>
));
Drawer.displayName = "Drawer";

const DrawerTrigger = DialogTrigger;
DrawerTrigger.displayName = "DrawerTrigger";

const DrawerClose = DialogClose;
DrawerClose.displayName = "DrawerClose";

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent> & VariantProps<typeof drawerVariants>
>(({ className, children, size, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="bg-black/80" />
    <DialogContent
      ref={ref}
      className={cn(
        "fixed inset-0 m-auto w-full max-w-md h-fit", // Centrage et largeur maximale
        "animate-in fade-in-0 zoom-in-95 duration-300", // Animation d'apparition
        "rounded-lg border bg-background p-6 shadow-lg", // Styles supplémentaires
        "overflow-y-auto", // Permettre le défilement si le contenu est trop long
        "transform -translate-x-1/2 -translate-y-1/2", // Centrage précis
        "top-1/2 left-1/2", // Positionnement au centre
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogClose>
      {children}
    </DialogContent>
  </DialogPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-auto flex flex-col gap-2 p-4", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = DialogTitle;
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = DialogDescription;
DrawerDescription.displayName = "DrawerDescription";

// Utilisation de React.ComponentProps pour extraire les propriétés de ScrollArea
type ScrollAreaProps = React.ComponentProps<typeof ScrollArea>;

const DrawerBody = ({ className, dir, ...props }: React.HTMLAttributes<HTMLDivElement> & { dir?: "ltr" | "rtl" }) => (
  <ScrollArea
    className={cn("p-4 px-6 flex-1 h-full", className)}
    dir={dir} // `dir` est maintenant correctement typé
    {...(props as ScrollAreaProps)} // Les autres propriétés sont passées avec le bon type
  />
);
DrawerBody.displayName = "DrawerBody";

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerBody,
};