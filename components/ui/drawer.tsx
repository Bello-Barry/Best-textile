"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogPortal, DialogOverlay, DialogClose } from "@/components/ui/dialog";

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

interface DrawerProps extends React.ComponentPropsWithoutRef<typeof Dialog>, 
  VariantProps<typeof drawerVariants> {
  shouldScaleBackground?: boolean;
  className?: string;
}

const Drawer = React.forwardRef<
  React.ElementRef<typeof Dialog>,
  DrawerProps
>(({ className, children, size, ...props }, ref) => (
  <Dialog {...props}>
    {children}
  </Dialog>
));
Drawer.displayName = "Drawer";

const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof Dialog.Trigger>,
  React.ComponentPropsWithoutRef<typeof Dialog.Trigger>
>(({ ...props }, ref) => <Dialog.Trigger ref={ref} {...props} />);
DrawerTrigger.displayName = "DrawerTrigger";

const DrawerClose = React.forwardRef<
  React.ElementRef<typeof Dialog.Close>,
  React.ComponentPropsWithoutRef<typeof Dialog.Close>
>(({ ...props }, ref) => <Dialog.Close ref={ref} {...props} />);
DrawerClose.displayName = "DrawerClose";

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent> & 
  VariantProps<typeof drawerVariants>
>(({ className, children, size, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay className="bg-black/80" />
    <DialogContent
      ref={ref}
      className={cn(
        drawerVariants({ size }),
        "translate-y-0 animate-in slide-in-from-bottom duration-300",
        "!rounded-b-none !rounded-t-xl !p-0 !border-t !border-x !border-border",
        "!top-auto !bottom-0 !left-0 !right-0",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      
      <DrawerClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DrawerClose>
      
      {children}
    </DialogContent>
  </DialogPortal>
));
DrawerContent.displayName = "DrawerContent";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("grid gap-1.5 p-4 text-center sm:text-left", className)}
    {...props}
  />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("mt-auto flex flex-col gap-2 p-4", className)}
    {...props}
  />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DrawerDescription.displayName = "DrawerDescription";

const DrawerBody = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <ScrollArea className={cn("p-4 px-6 flex-1 h-full", className)} {...props} />
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