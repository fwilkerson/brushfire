# Brushfire

Brushfire - Realtime anonymous polling

## User Story - The user wants to create a new poll.

User enters a question

User enters at least two potential options to choose from

User selects create poll and is given a link

If the creator of the poll visits the link they are shown the realtime results

The user can choose to end the poll at any time

Polling is automatically ended after three days

If a user visits a poll that has ended they are shown the results of the poll

## User Story - The user wants to vote on a poll.

User visits the link of the poll

User selects one or more of the given options

### Creators need a way to say a user can enter multiple answers

After user submits their answer(s) they are shown the results

### Should users be able to see the results without voting?

## Technical Challenges

* Generating links for each poll

* Potentially a url shortener

* Check IP address to prevent spammers?

* How do we determine if a user created the poll if they are anon?

## Architecture

Front end should be server rendered for SEO

Some form of charting (pie, bar, etc) is needed to visualize the results

Page loads need to be fucking fast (minimal dependencies)

Event driven backend

The read should only load data for the active aggregates

If an aggregate has not been queried in 24hrs drop it from the cache

Query strategy for loading an aggragate should look like...

```sql
SELECT * FROM events where aggregateId = 'some-aggregate-id' ORDER BY eventId
```

The resulting aggragate can be built from the events in the above query. Then the read would need to subscribe to any events for the aggregate to keep it's data up to date

### Command Structure

```javascript
const command = {
	// CREATE_POLL, VOTE_ON_POLL, CLOSE_POLL
	type: 'string'
	// the data associated with the command
	payload: {}
}
```

### Event Structure

```javascript
const event = {
	// the row id, needed to perserve the order of events
	eventId: 'serial (int)',
	// refers to the poll (possible used in the generated uri?)
	aggregateId: 'uuid',
	// POLL_CREATED, USER_VOTED_ON_POLL, POLL_CLOSED
	type: 'string',
	// date & time the event was created
	createdAt: 'timestamp',
	// the data associated with the event
	payload: 'JSON',
};
```

I think the greatest challenge would be is the aggregate treated as a pub/sub topic. If so how do we ensure nothing is missed when we subscribe? _Perhaps create the subscription once the aggregateId is generated & before the event is published._

Because polls are automatically closed after 24hrs we can remove the topic subscription for that aggregateId after 24hrs. If a user asks for a closed poll, simply rebuild the aggregate from scratch. In the event of a large aggregate we could chose to create a snapshot after a certain number of events (or create a snapshot after 24hrs?).
