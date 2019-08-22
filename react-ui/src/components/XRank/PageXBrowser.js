import React, { useEffect } from "react"
import { Segment } from "semantic-ui-react"
import { Spin, Table } from "antd"
import { useQuery } from "@apollo/react-hooks"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

import { searchForPlacements } from "../../graphql/queries/searchForPlacements"
import language_dict from '../../utils/english_internal.json'
import { modesArr } from '../../img/imports'

const PageXBrowser = ({ setMenuSelection }) => {
  const localization = useSelector(state => state.localization)
  const { data, error, loading } = useQuery(searchForPlacements, {
    variables: {}
  })

  useEffect(() => {
    document.title = `${localization["Top 500 Browser"]} - sendou.ink`
    setMenuSelection("search")
  }, [localization, setMenuSelection])

  if (error) return <div style={{ color: "red" }}>{error.message}</div>
  if (loading) return <Spin />

  const columns = [
    {
      title: localization['Name'],
      dataIndex: 'name',
      render: name => <Link to>{name}</Link>,
    },
    {
      title: localization['X Power'],
      dataIndex: 'x_power',
    },
    {
      title: localization['Mode'],
      dataIndex: 'mode',
      render: mode => <img src={modesArr[mode]} alt={mode} />,
    },
    {
      title: localization['Placement'],
      dataIndex: 'rank',
    },
    {
      title: localization['Weapon'],
      dataIndex: 'weapon',
      render: weapon => <img src={process.env.PUBLIC_URL + `/wpnSmall/Wst_${language_dict[weapon]}.png`} alt={weapon} />
    },
    {
      title: localization['Month'],
      dataIndex: 'month',
    }
    {
      title: localization['Year'],
      dataIndex: 'year',
    }
    {
      title: localization['ID'],
      dataIndex: 'unique_id',
    }
  ]

  console.log("data", data)
  return (
    <Segment>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        title={() => "Header"}
        footer={() => "Footer"}
      />
    </Segment>
  )
}

export default PageXBrowser
