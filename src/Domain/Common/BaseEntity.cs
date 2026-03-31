using System.ComponentModel.DataAnnotations.Schema;

namespace MainApi.Domain.Common;

public abstract class BaseEntity<TKey> : IEntity
{
    // This can easily be modified to be BaseEntity<T> and public T Id to support different key types.
    // Using non-generic integer types for simplicity
    public TKey  Id { get; protected set; } = default!;

    private readonly List<BaseEvent> _domainEvents = new();

    [NotMapped]
    public IReadOnlyCollection<BaseEvent> DomainEvents => _domainEvents.AsReadOnly();

    public void AddDomainEvent(BaseEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void RemoveDomainEvent(BaseEvent domainEvent)
    {
        _domainEvents.Remove(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
public abstract class BaseEntity : BaseEntity<int>
{
}
public interface IEntity
{
    IReadOnlyCollection<BaseEvent> DomainEvents { get; }
    void AddDomainEvent(BaseEvent domainEvent);
    void RemoveDomainEvent(BaseEvent domainEvent);
    void ClearDomainEvents();
}
