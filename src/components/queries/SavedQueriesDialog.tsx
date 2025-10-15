import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2, Search, Calendar } from 'lucide-react'
import { useQueries } from '@/hooks/useQueries'
import { useAuth } from '@/components/auth/AuthProvider'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/hooks/use-toast'

interface SavedQueriesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoadQuery?: (queryData: any, platforms: string[]) => void
}

export const SavedQueriesDialog: React.FC<SavedQueriesDialogProps> = ({ 
  open, 
  onOpenChange, 
  onLoadQuery 
}) => {
  const { queries, loading, deleteQuery } = useQueries()
  const { user, isSupabaseConnected } = useAuth()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  if (!user || !isSupabaseConnected) {
    return null
  }

  const handleDelete = async (queryId: string) => {
    setDeletingId(queryId)
    const success = await deleteQuery(queryId)
    if (success) {
      toast({
        title: 'Query deleted',
        description: 'Your saved query has been deleted.',
      })
    } else {
      toast({
        title: 'Error',
        description: 'Failed to delete query. Please try again.',
        variant: 'destructive',
      })
    }
    setDeletingId(null)
  }

  const handleLoadQuery = (query: any) => {
    if (onLoadQuery) {
      onLoadQuery(query.query_data, query.platforms)
      onOpenChange(false)
      toast({
        title: 'Query loaded',
        description: `"${query.title}" has been loaded into the search builder.`,
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  // Sort queries alphabetically by title
  const sortedQueries = [...queries].sort((a, b) =>
    a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Saved Queries</DialogTitle>
          <DialogDescription>
            Load or manage your saved search queries.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 mt-4">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 border rounded-lg">
                <Skeleton className="h-5 w-full" />
              </div>
            ))
          ) : sortedQueries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No saved queries yet</h3>
              <p>Save your first query to see it here!</p>
            </div>
          ) : (
            sortedQueries.map((query) => (
              <div
                key={query.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent transition-colors"
              >
                {/* Query Title */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{query.title}</span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(query.created_at)}
                    </span>
                    {query.platforms.map((platform) => (
                      <Badge key={platform} variant="secondary" className="text-xs">
                        {platform}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <Button
                    onClick={() => handleLoadQuery(query)}
                    size="sm"
                    variant="ghost"
                    className="h-8 text-xs"
                  >
                    📂 Load
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(query.id)}
                    disabled={deletingId === query.id}
                    className="h-8 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}