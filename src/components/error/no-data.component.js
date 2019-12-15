// external libraries
import React from "react"
// local services & data store
// local containers
// local components
// local constants
// local styles

const NoData = ({ error, noData }) => {

  return (
    <div>
      {error && <h1>Error loading data</h1>}
      {noData && <h1>No data supplied</h1>}
    </div>
  )
}

export default NoData
