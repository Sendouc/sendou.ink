import React, { useEffect, useState } from "react"
import { Segment } from "semantic-ui-react"
import { Spin, Table, Avatar, Button, Input, Radio, InputNumber } from "antd"
import { useQuery } from "@apollo/react-hooks"
import { useSelector } from "react-redux"
import { Link } from "react-router-dom"

import { searchForPlacements } from "../../graphql/queries/searchForPlacements"
import language_dict from "../../utils/english_internal.json"
import { modesArr } from "../../img/imports"
import Select from "../elements/Select"

const PageXBrowser = ({ setMenuSelection }) => {
  const localization = useSelector(state => state.localization)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState({
    name: null,
    weapon: null,
    mode: null,
    unique_id: null,
    month: null,
    year: null
  })
  const [showForms, setShowForms] = useState(false)
  const [nameForm, setNameForm] = useState("")
  const [weaponForm, setWeaponForm] = useState(null)
  const [modeForm, setModeForm] = useState(0)
  const [idForm, setIdForm] = useState("")
  const [monthForm, setMonthForm] = useState("")
  const [yearForm, setYearForm] = useState("")
  const { data, error, loading } = useQuery(searchForPlacements, {
    variables: { page, ...filter }
  })

  const handleFilterChange = () => {
    // Empty input gets changed to null
    const name = nameForm === "" ? null : nameForm
    const mode = modeForm === 0 ? null : modeForm
    const unique_id = idForm === "" ? null : idForm
    const month = monthForm === "" ? null : monthForm
    const year = yearForm === "" ? null : yearForm
    const weapon = weaponForm

    setPage(1)
    setFilter({
      name,
      weapon,
      mode,
      unique_id,
      month,
      year
    })
  }

  const handleClear = () => {
    setNameForm("")
    setModeForm(0)
    setIdForm("")
    setMonthForm("")
    setYearForm("")
    setWeaponForm(null)
  }

  useEffect(() => {
    document.title = `${localization["Top 500 Browser"]} - sendou.ink`
    setMenuSelection("search")
  }, [localization, setMenuSelection])

  if (error) return <div style={{ color: "red" }}>{error.message}</div>
  if (loading && !data) return <Spin />

  const columns = [
    {
      dataIndex: "player",
      render: player =>
        player.twitter ? (
          <Avatar
            size="small"
            src={`https://avatars.io/twitter/${player.twitter}/small`}
          />
        ) : null
    },
    {
      title: localization["Name"],
      dataIndex: "name",
      render: (name, record) => (
        <Link to={`/xsearch/p/${record.unique_id}`}>{name}</Link>
      )
    },
    {
      title: localization["X Power"],
      dataIndex: "x_power"
    },
    {
      title: localization["Weapon"],
      dataIndex: "weapon",
      render: weapon => (
        <img
          style={{ cursor: "pointer" }}
          src={
            process.env.PUBLIC_URL +
            `/wpnSmall/Wst_${language_dict[weapon]}.png`
          }
          alt={weapon}
          onClick={() => {
            setWeaponForm(weapon)
            setShowForms(true)
          }}
        />
      )
    },
    {
      title: localization["Mode"],
      dataIndex: "mode",
      render: mode => (
        <img
          style={{ height: "32px", width: "auto", cursor: "pointer" }}
          src={modesArr[mode]}
          alt={mode}
          onClick={() => {
            setModeForm(mode)
            setShowForms(true)
          }}
        />
      )
    },
    {
      title: localization["Placement"],
      dataIndex: "rank"
    },
    {
      title: localization["Month"],
      dataIndex: "month",
      render: month => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            setMonthForm(month)
            setShowForms(true)
          }}
        >
          {month}
        </span>
      )
    },
    {
      title: localization["Year"],
      dataIndex: "year",
      render: year => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            setYearForm(year)
            setShowForms(true)
          }}
        >
          {year}
        </span>
      )
    },
    {
      title: localization["ID"],
      dataIndex: "unique_id",
      render: unique_id => (
        <span
          style={{ cursor: "pointer" }}
          onClick={() => {
            setIdForm(unique_id)
            setShowForms(true)
          }}
        >
          {unique_id}
        </span>
      )
    }
  ]

  return (
    <Segment>
      <div style={{ margin: "1em" }}>
        <Button onClick={() => setShowForms(!showForms)}>
          {showForms
            ? localization["Hide filter options"]
            : localization["Show filter options"]}
        </Button>
      </div>
      {showForms && (
        <div style={{ margin: "1em" }}>
          <div style={{ margin: "0.5em 0" }}>
            {localization["Name"]}
            <br />
            <Input
              value={nameForm}
              onChange={e => setNameForm(e.target.value)}
              style={{ width: 200 }}
              maxLength={10}
              onPressEnter={() => handleFilterChange()}
            />
          </div>
          <div style={{ margin: "0.5em 0" }}>
            {localization["ID"]}
            <br />
            <Input
              value={idForm}
              onChange={e => setIdForm(e.target.value)}
              style={{ width: 200 }}
              onPressEnter={() => handleFilterChange()}
            />
          </div>
          <div style={{ margin: "0.5em 0" }}>
            {localization["Weapon"]}
            <br />
            <Select
              value={weaponForm}
              onChange={value => setWeaponForm(value)}
              content="MAINWEAPONS"
              allowClear
            />
          </div>
          <div style={{ margin: "0.5em 0" }}>
            {localization["Mode"]}
            <br />
            <Radio.Group
              onChange={e => setModeForm(e.target.value)}
              value={modeForm}
            >
              <Radio value={0}>{localization["All Modes"]}</Radio>
              <Radio value={1}>{localization["Splat Zones"]}</Radio>
              <Radio value={2}>{localization["Tower Control"]}</Radio>
              <Radio value={3}>{localization["Rainmaker"]}</Radio>
              <Radio value={4}>{localization["Clam Blitz"]}</Radio>
            </Radio.Group>
          </div>
          <div style={{ margin: "0.5em 0" }}>
            {`${localization["Month"]} / ${localization["Year"]}`}
            <br />
            <InputNumber
              min={1}
              max={12}
              value={monthForm}
              onChange={value => setMonthForm(value)}
            />{" "}
            <InputNumber
              min={2018}
              max={new Date().getFullYear()}
              value={yearForm}
              onChange={value => setYearForm(value)}
            />
          </div>
          <div style={{ margin: "1em 0" }}>
            <Button type="primary" onClick={handleFilterChange}>
              {localization["Search"]}
            </Button>{" "}
            <Button type="danger" onClick={handleClear}>
              {localization["Clear All"]}
            </Button>
          </div>
        </div>
      )}
      <div style={{ margin: "1em" }}>
        <Table
          columns={columns}
          dataSource={data.searchForPlacements.placements}
          pagination={{
            pageSize: 25,
            position: "both",
            showQuickJumper: true,
            total: data.searchForPlacements.pageCount * 25,
            current: page,
            onChange: page => setPage(page)
          }}
          rowKey="id"
          scroll={{ x: true }}
          loading={loading}
        />
      </div>
    </Segment>
  )
}

export default PageXBrowser
