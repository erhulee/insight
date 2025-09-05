import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import EditSurveyPage from '../[id]/page'

describe('Page', () => {
  it('renders a heading', () => {
    render(<div >
      <h1>Hello</h1>
    </div>)

    const heading = screen.getByRole('heading', { level: 1 })

    expect(heading).toBeInTheDocument()
  })
})