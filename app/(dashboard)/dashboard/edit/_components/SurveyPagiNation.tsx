import { trpc } from '@/app/_trpc/client'
import {
  deletePage,
  insertPage,
  runtimeStore,
  setCurrentPage,
} from '@/app/dashboard/_valtio/runtime'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import { useSnapshot } from 'valtio'

export function SurveyPagiNation() {
  const runtimeState = useSnapshot(runtimeStore)
  const currentPage = runtimeState.currentPage
  const mutation = trpc.InsertSurveyNewPage.useMutation()
  const [dialogOpen, openDialog] = useState(false)
  const changePage = (page: string) => {
    switch (page) {
      case 'page:add':
        mutation.mutate(
          {
            id: runtimeState.surveyId,
          },
          {
            onSuccess: (data) => {
              insertPage(data.pageCount)
            },
          },
        )
        break
      default:
        const pageNum = parseInt(page.split(':')[1])
        setCurrentPage(pageNum)
        break
    }
  }
  const dialogPageIndexRef = useRef<number>(-1)
  const onDeletePage = (pageIndex: number) => {
    const deleteQuestionCnt = runtimeState.questions.filter((i) => i.ownerPage == pageIndex).length
    if (deleteQuestionCnt > 0) {
      dialogPageIndexRef.current = pageIndex
      openDialog(true)
      return
    }
    realDelete(pageIndex)
  }

  const realDelete = async (pageIndex: number) => {
    deletePage(pageIndex)
    openDialog(false)
  }
  const pagination = new Array(runtimeState.pageCount).fill(1).map((_, index) => {
    return (
      <ContextMenu key={index}>
        <ContextMenuTrigger className="">
          <ToggleGroupItem value={`page:${index + 1}`} key={`page:${index + 1}`}>
            {index + 1}
          </ToggleGroupItem>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={() => onDeletePage(index + 1)}>
            <span className="text-sm">删除</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    )
  })

  return (
    <>
      <ToggleGroup type="single" size="sm" value={`page:${currentPage}`} onValueChange={changePage}>
        {pagination}
        <ToggleGroupItem value="page:add">
          <Plus></Plus>
        </ToggleGroupItem>
      </ToggleGroup>
      <AlertDialog open={dialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认要删除该页么</AlertDialogTitle>
            <AlertDialogDescription>该页中有问卷题目，删除后无法恢复</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => openDialog(false)}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => realDelete(dialogPageIndexRef.current)}>
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
