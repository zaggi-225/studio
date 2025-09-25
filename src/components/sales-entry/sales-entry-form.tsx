'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, startOfTomorrow } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';


// Note: Audio playback and offline sync logic are placeholder comments.
// You would need to implement services for these features.

const formSchema = z.object({
  date: z.date({
    required_error: 'A date is required.',
  }).max(startOfTomorrow(), { message: "Date cannot be in the future." }),
  size: z.string({ required_error: 'Please select a size.' }),
  otherSize: z.string().optional(),
  pieces: z.coerce.number().min(1, 'Please enter the number of pieces.'),
  amount: z.coerce.number().min(1, 'Please enter the total amount.'),
  branch: z.string({ required_error: 'Please select a branch.' }),
  name: z.string({ required_error: 'Please select a name.' }),
}).refine(data => {
    if (data.size === 'other' && !data.otherSize) {
        return false;
    }
    return true;
}, {
    message: 'Please specify the size.',
    path: ['otherSize'],
});


export function SalesEntryForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { firestore, user } = useFirebase();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      size: '',
      otherSize: '',
      pieces: 0,
      amount: 0,
      branch: '',
      name: '',
    },
  });

  const selectedSize = form.watch('size');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!firestore || !user) {
        toast({
            variant: "destructive",
            title: "⚠️ Error",
            description: "Could not connect to the database. Please try again.",
        });
        setIsLoading(false);
        return;
    }

    const entryData = {
        date: values.date,
        size: values.size === 'other' ? values.otherSize : values.size,
        pieces: values.pieces,
        amount: values.amount,
        branch: values.branch,
        name: values.name,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
    };

    try {
        const salesEntriesRef = collection(firestore, 'sales_entries');
        addDocumentNonBlocking(salesEntriesRef, entryData);
        
        toast({
            title: '✅ Entry Saved',
            description: 'Your sales entry has been saved successfully.',
        });
        form.reset({ date: new Date(), size: '', otherSize: '', pieces: 0, amount: 0, branch: '', name: '' });
    } catch (error) {
        console.error("Error saving entry:", error);
        toast({
            variant: "destructive",
            title: "⚠️ Error",
            description: "There was a problem saving your entry. Please try again.",
        });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-lg flex items-center gap-2 mb-2">
                    <span>📅</span> Date
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={'outline'}
                        className={cn(
                          'w-full pl-3 text-left font-normal h-14 text-lg',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date > startOfTomorrow()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branch"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg flex items-center gap-2">
                    <span>🏬</span> Branch
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Select a branch" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Nidagundi" className="text-lg">Nidagundi</SelectItem>
                    <SelectItem value="Basavana Bagewadi" className="text-lg">Basavana Bagewadi</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
           <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg flex items-center gap-2">🧑‍💼 Name</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-14 text-lg">
                        <SelectValue placeholder="Select a name" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="M.R Bijapur">M.R Bijapur</SelectItem>
                      <SelectItem value="Jaggu">Jaggu</SelectItem>
                      <SelectItem value="Pavitra">Pavitra</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

          <FormField
            control={form.control}
            name="size"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg flex items-center gap-2">
                    <span>📐</span> Size
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-14 text-lg">
                      <SelectValue placeholder="Select a size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="18x24" className="text-lg">18 x 24</SelectItem>
                    <SelectItem value="24x30" className="text-lg">24 x 30</SelectItem>
                    <SelectItem value="30x40" className="text-lg">30 x 40</SelectItem>
                    <SelectItem value="other" className="text-lg">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedSize === 'other' && (
            <FormField
              control={form.control}
              name="otherSize"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg">Specify Size</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 50x60" {...field} className="h-14 text-lg" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="pieces"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg flex items-center gap-2">
                    <span>🔢</span> No. of Pieces
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0" {...field} className="h-14 text-lg" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="md:col-span-2">
            <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="text-lg flex items-center gap-2">
                        <span>💰</span> Amount
                    </FormLabel>
                    <FormControl>
                    <Input type="number" placeholder="0.00" {...field} className="h-14 text-lg" />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
          </div>

        </div>

        <Button type="submit" className="w-full h-16 text-xl bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          ) : (
            <span className="flex items-center gap-2">✅ Save Entry</span>
          )}
        </Button>
      </form>
    </Form>
  );
}

    