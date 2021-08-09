import { createContext, ReactChild, ReactElement, useState, useCallback } from 'react'
import { getNodeApi, getNodeApiList, NodeApi } from '../utils'

export interface ApplicationInterface {
  nodeApi: NodeApi
  nodeApiList: NodeApi[]
  refresh: () => void
}

const initialValues: ApplicationInterface = {
  refresh: () => {
    ///
  },
  nodeApi: getNodeApi(),
  nodeApiList: getNodeApiList(),
}

export const Context = createContext<ApplicationInterface>(initialValues)
export const Consumer = Context.Consumer

interface Props {
  children: ReactChild
}

export function Provider({ children }: Props): ReactElement {
  const [nodeApi, setNodeApi] = useState<NodeApi>(initialValues.nodeApi)
  const [nodeApiList, setNodeApiList] = useState<NodeApi[]>(initialValues.nodeApiList)

  const refresh = useCallback(() => {
    setNodeApi(getNodeApi())
    setNodeApiList(getNodeApiList())
  }, [setNodeApi, setNodeApiList])

  return <Context.Provider value={{ nodeApi, nodeApiList, refresh }}>{children}</Context.Provider>
}
