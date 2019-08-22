import React, { useState, useEffect } from "react"
import { useQuery } from "@apollo/react-hooks"
import { Spin, List, Pagination, Empty } from "antd"
import { useSelector } from 'react-redux'

import { searchForBuildsByWeapon } from "../../graphql/queries/searchForBuildsByWeapon"
import BuildCard from "../elements/BuildCard"
import useWindowDimensions from "../hooks/useWindowDimensions";

const BuildsList = ({ weapon }) => {
  const { containerWidth } = useWindowDimensions()
  const localization = useSelector(state => state.localization)
  const [page, setPage] = useState(1)
  const { data, error, loading } = useQuery(searchForBuildsByWeapon, {
    variables: { weapon, page }
  })

  useEffect(() => {
    setPage(1)
    if (weapon) document.title = `${localization[weapon]} ${localization["Builds"]} - sendou.ink`
  }, [weapon, localization])

  if (error) return <div style={{ color: "red" }}>{error.message}</div>
  if (loading) return <Spin />

  const builds = data.searchForBuildsByWeapon.builds
  if (builds.length === 0) return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={localization["No builds for this weapon yet. You can submit the first one!"]} />
  
  let column = 1
  if (containerWidth > 933) column = 4
  else if (containerWidth > 723) column = 3
  else if (containerWidth > 500) column = 2

  const pageCount = data.searchForBuildsByWeapon.pageCount
  return (
    <> 
      <List
        grid={{ gutter: 16, column }}
        dataSource={builds}
        renderItem={item => (
          <List.Item>
            <BuildCard build={item} />
          </List.Item>
        )}
      />
      <div>
        {pageCount > 1 && <Pagination current={page} onChange={(page) => setPage(page)} total={pageCount * 10} />}
      </div>
    </>
  )
}

export default BuildsList
